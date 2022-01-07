import moment from '_obsidian@0.13.11@obsidian/node_modules/moment';
import dailyNotesService from '../services/dailyNotesService';
import { getDailyNote } from 'obsidian-daily-notes-interface';

//这个函数是点memo中的item然后打开dailynote文件的。
export const showMemoInDailyNotes = async ( memoId: string): Promise<any> => {

    const { app, dailyNotes } = dailyNotesService.getState();
    console.log("break");
    const lineNum = parseInt(memoId.slice(14));
    const memoDateString = memoId.slice(0,13);
    const date = moment(memoDateString, "YYYYMMDDHHmmss");
    const file = getDailyNote(date, dailyNotes);
    const leaf = app.workspace.splitActiveLeaf();
    leaf.openFile(file, {eState: {line: lineNum}});
    return ;
}