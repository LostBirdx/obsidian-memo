
import { normalizePath, TFolder, TFile} from "obsidian";
import { getAllDailyNotes,getDailyNoteSettings,getDateFromFile } from "obsidian-daily-notes-interface";
import appStore from "../stores/appStore";

export class DailyNotesFolderMissingError extends Error {}


export async function getRemainingTasks(note: TFile): Promise<number> {
  if (!note) {
    return 0;
  }
  const { vault } = appStore.getState().dailyNotesState.app;
  let fileContents = await vault.cachedRead(note);
  //eslint-disable-next-line
  const matchLength = (fileContents.match(/(-|\*) (\[ \]\s)?((\<time\>)?\d{1,2}\:\d{2})?/g) || []).length;
  fileContents = null;
  return matchLength;
}

export async function getTasksForDailyNote(
  dailyNote: TFile | null, dailyEvents: any[]
): Promise<any[]> {
  if (!dailyNote) {
    return [];
  }
  const { vault } = appStore.getState().dailyNotesState.app;
  const Tasks = await getRemainingTasks(dailyNote);
  if (Tasks) {
    let fileContents = await vault.cachedRead(dailyNote);
    let fileLines = getAllLinesFromFile(fileContents);
    const startDate = getDateFromFile(dailyNote, "day");
    const endDate = getDateFromFile(dailyNote, "day");
    for (let i = 0; i < fileLines.length; i++) {
      const line = fileLines[i];
      const rawText = extractTextFromTodoLine(line);
      if (line.length === 0) continue
      if (lineContainsTime(line)) {
          startDate.hours(parseInt(extractHourFromBulletLine(line)));
          startDate.minutes(parseInt(extractMinFromBulletLine(line)));
          endDate.hours(parseInt(extractHourFromBulletLine(line)));
          if(parseInt(extractHourFromBulletLine(line)) > 22){
            endDate.minutes(parseInt(extractMinFromBulletLine(line)));
          }else{
            endDate.minutes(parseInt(extractMinFromBulletLine(line)));
          }
          dailyEvents.push({
            id: startDate.format('YYYYMMDDHHmmSS') + i,
            content: rawText,
            user_id: 1,
            createdAt: startDate.format('YYYY/MM/DD HH:mm:SS'),
            updatedAt: endDate.format('YYYY/MM/DD HH:mm:SS'),
          });
        }
    }
    fileLines = null;
    fileContents = null;
  }
}

export async function getMemos(): Promise<any[]> {

  const events: any[] | PromiseLike<any[]> = [];
  const { vault } = appStore.getState().dailyNotesState.app;
  const { folder } = getDailyNoteSettings();

  const dailyNotesFolder = vault.getAbstractFileByPath(
    normalizePath(folder)
  ) as TFolder;

  if (!dailyNotesFolder) {
    throw new DailyNotesFolderMissingError("Failed to find daily notes folder");
  }

  const dailyNotes = getAllDailyNotes();

  for( const string in dailyNotes ){
    if(dailyNotes[string] instanceof TFile){
      await getTasksForDailyNote(dailyNotes[string], events);
    }
  }

  return events;
}

const getAllLinesFromFile = (cache: string) => cache.split(/\r?\n/)
// const lineIsValidTodo = (line: string) => {
// //eslint-disable-next-line
//   return /^\s*[\-\*]\s\[(\s|x|X|\\|\-|\>|D|\?|\/|\+|R|\!|i|B|P|C)\]\s?\s*\S/.test(line)
// }
const lineContainsTime = (line: string) => {
  //eslint-disable-next-line
    return /^\s*[\-\*]\s(\[(\s|x|X|\\|\-|\>|D|\?|\/|\+|R|\!|i|B|P|C)\]\s)?(\<time\>)?\d{1,2}\:\d{2}(.*)$/.test(line)
  }
//eslint-disable-next-line
const extractTextFromTodoLine = (line: string) => /^\s*[\-\*]\s(\[(\s|x|X|\\|\-|\>|D|\?|\/|\+|R|\!|i|B|P|C)\]\s?)?(\<time\>)?((\d{1,2})\:(\d{2}))?(\<\/time\>)?\s?(.*)$/.exec(line)?.[8]
//eslint-disable-next-line
const extractHourFromBulletLine = (line: string) => /^\s*[\-\*]\s(\[(\s|x|X|\\|\-|\>|D|\?|\/|\+|R|\!|i|B|P|C)\]\s?)?(\<time\>)?(\d{1,2})\:(\d{2})(.*)$/.exec(line)?.[4]
//eslint-disable-next-line
const extractMinFromBulletLine = (line: string) => /^\s*[\-\*]\s(\[(\s|x|X|\\|\-|\>|D|\?|\/|\+|R|\!|i|B|P|C)\]\s?)?(\<time\>)?(\d{1,2})\:(\d{2})(.*)$/.exec(line)?.[5]
