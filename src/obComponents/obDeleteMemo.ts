import { getDailyNotePath } from "./obUpdateMemo";
import { TFile, normalizePath, Notice } from 'obsidian';
import moment from '_obsidian@0.13.11@obsidian/node_modules/moment';
import appStore from "../stores/appStore";
import { createDailyNote, getAllDailyNotes, getDailyNote } from "obsidian-daily-notes-interface";
import { insertAfterHandler } from "./obCreateMemo";
import { InsertAfter } from "../memos";

export async function restoreDeletedMemo(deletedMemoid: string): Promise<any[]> {

    const { vault, metadataCache } = appStore.getState().dailyNotesState.app;
    if(/\d{14,}/.test(deletedMemoid)){

        const filePath = getDailyNotePath();
        const absolutePath = filePath + "/delete.md";
        const deleteFile = metadataCache.getFirstLinkpathDest("" , absolutePath);

        if (deleteFile instanceof TFile) {
            let fileContents = await vault.cachedRead(deleteFile);
            let fileLines = getAllLinesFromFile(fileContents);
            if(fileLines.length === 0){
                return ;
            }else{
                const lineNum = parseInt(deletedMemoid.slice(14,));
                const line = fileLines[lineNum-1];
                const newDeletefileContents = fileContents.replace(line,"");
                await vault.modify(deleteFile, newDeletefileContents);
                if((/^- (.+)$/.test(line))){
                    const id = extractIDfromText(line);
                    const date = moment(id,"YYYYMMDDHHmmss");
                    const timeHour =  date.format('HH');
                    const timeMinute = date.format('mm');

                    const newEvent = `- ` + String(timeHour) + `:` + String(timeMinute) + ` ` + extractContentfromText(line);
                    const dailyNotes = await getAllDailyNotes();
                    const existingFile = getDailyNote(date, dailyNotes);
                    if(!existingFile){
                        const file = await createDailyNote(date);
                        const fileContents = await vault.cachedRead(file);
                        const newFileContent = await insertAfterHandler(InsertAfter, newEvent ,fileContents);
                        await vault.modify(file, newFileContent);
                        return [{
                            deletedAt: "",
                        }]
                    }else{
                        const fileContents = await vault.cachedRead(existingFile);
                        const newFileContent = await insertAfterHandler(InsertAfter, newEvent ,fileContents);
                        await vault.modify(existingFile, newFileContent);
                        return [{
                            deletedAt: "",
                        }]
                    }    
                }
                fileLines = null;
                fileContents = null;
            }
        }   
    }
}


export async function deleteForever(deletedMemoid: string): Promise<void> {

    const { vault, metadataCache } = appStore.getState().dailyNotesState.app;
    if(/\d{14,}/.test(deletedMemoid)){

        const filePath = getDailyNotePath();
        const absolutePath = filePath + "/delete.md";
        const deleteFile = metadataCache.getFirstLinkpathDest("" , absolutePath);

        if (deleteFile instanceof TFile) {
            let fileContents = await vault.cachedRead(deleteFile);
            let fileLines = getAllLinesFromFile(fileContents);
            if(fileLines.length === 0){
                return ;
            }else{
                const lineNum = parseInt(deletedMemoid.slice(14,));
                const line = fileLines[lineNum-1];
                if((/^- (.+)$/.test(line))){
                    // const id = extractIDfromText(fileLines[i]);
                    console.log((/^- (.+)$/.test(line)));
                    const newFileContent = fileContents.replace(line, "");
                    await vault.modify(deleteFile, newFileContent);
                }
            }
        fileLines = null;
        fileContents = null;
        }
    }   
    // return deletedMemos;
}

export async function getDeletedMemos(): Promise<any[]> {

    const { vault, metadataCache } = appStore.getState().dailyNotesState.app;

    const filePath = getDailyNotePath();
    const absolutePath = filePath + "/delete.md";
    const deletedMemos: any[] | PromiseLike<any[]> = [];
    const deleteFile = metadataCache.getFirstLinkpathDest("" , absolutePath);
    if (deleteFile instanceof TFile) {
      let fileContents = await vault.cachedRead(deleteFile);
      let fileLines = getAllLinesFromFile(fileContents);
      if(fileLines.length === 0){
          return deletedMemos;
      }else{
        for (let i = 0; i < fileLines.length; i++) {
            const line = fileLines[i];
            if(!(/- /.test(line))){
                continue;
            }else{
                const id = extractIDfromText(line);
                const timeString = id.slice(0,13);
                // const idString = parseInt(id.slice(14));
                const createdDate = moment(timeString, "YYYYMMDDHHmmss");
                const deletedDateID = extractDeleteDatefromText(fileLines[i]);
                const deletedDate = moment(deletedDateID.slice(0,13),"YYYYMMDDHHmmss");
                const content = extractContentfromText(fileLines[i]);
                deletedMemos.push({
                  id: deletedDateID,
                  content: content,
                  user_id: 1,
                  createdAt: createdDate.format('YYYY/MM/DD HH:mm:SS'),
                  updatedAt: createdDate.format('YYYY/MM/DD HH:mm:SS'),
                  deletedAt: deletedDate,
                });
              }
         }
      }
      
      fileLines = null;
      fileContents = null;
    }
    return deletedMemos;
}


export const sendMemoToDelete = async (memoContent: string): Promise<any> =>{

    const { metadataCache, vault } = appStore.getState().dailyNotesState.app;

    const filePath = getDailyNotePath();
    const absolutePath = filePath + "/delete.md";

    const deleteFile = metadataCache.getFirstLinkpathDest("" , absolutePath);
    console.log(deleteFile);
    if(deleteFile instanceof TFile){
        const fileContents = await vault.cachedRead(deleteFile);
        const fileLines = getAllLinesFromFile(fileContents);
        const date = moment();
        const deleteDate = date.format("YYYY/MM/DD HH:mm:ss");
        let lineNum;
        if(fileLines.length === 1 && fileLines[0] === ""){
            lineNum = 1;
        }else{
            lineNum = fileLines.length + 1;
        }
        const deleteDateID = date.format("YYYYMMDDHHmmss") + lineNum;

        await createDeleteMemoInFile(deleteFile, fileContents , memoContent , deleteDateID);

        return deleteDate
    }else{
        const deleteFilePath = normalizePath(absolutePath);
        console.log(deleteFilePath);
        const file = await createdeleteFile(deleteFilePath); //这个里面，如果delefile已经存在就会创建失败，然后抛出异常。
        // const fileContents = await vault.cachedRead(deleteFile);
        // const fileLines = getAllLinesFromFile(fileContents);
        const date = moment();
        const deleteDate = date.format("YYYY/MM/DD HH:mm:ss");
        const lineNum = 1;
        const deleteDateID = date.format("YYYYMMDDHHmmss") + lineNum;
        
        await createDeleteMemoInFile(file, "" , memoContent , deleteDateID);
        // console.log("12");
        return deleteDate;
    }
}


export const createDeleteMemoInFile = async (file: TFile, fileContent: string, memoContent: string, deleteDate: string): Promise<any> =>{

    const { vault } = appStore.getState().dailyNotesState.app;
    let newContent;
    if(fileContent === ""){
        newContent = memoContent + " deletedAt: " + deleteDate;
    }else{
        newContent = fileContent + "\n" + memoContent + " deletedAt: " + deleteDate;
    }
    
    await vault.append(file, "\n"+newContent);
    // console.log(newContent);
    return true;
}


export const createdeleteFile = async (path: string): Promise<TFile> => {
    const { vault } = appStore.getState().dailyNotesState.app;
    console.log(path);
    try {
        //修复这个bug的关键就是需要一个根据路径返回TFile对象的API
        if(!vault.getAbstractFileByPath(path))
        {
            const createdFile = await vault.create(path, "");
            console.log(createdFile);
            return createdFile; 
        }
        else
        {
            const createdFile = vault.getAbstractFileByPath(path);
            console.log(createdFile);
            return createdFile;
        }

              
    }
    catch (err) {
        console.error(`Failed to create file: '${path}'`, err); //这里的bug是因为文件已经存在了。
        new Notice("Unable to create new file.");
    }
}

const getAllLinesFromFile = (cache: string) => cache.split(/\r?\n/);
//eslint-disable-next-line
const extractIDfromText = (line: string) => /^- (\d{14})(\d+)\s(.+)\s(deletedAt: )(.+)$/.exec(line)?.[1]
//eslint-disable-next-line
const extractContentfromText = (line: string) => /^- (\d+)\s(.+)\s(deletedAt: )(.+)$/.exec(line)?.[2]
//eslint-disable-next-line
const extractDeleteDatefromText = (line: string) => /^- (\d+)\s(.+)\s(deletedAt: )(.+)$/.exec(line)?.[4]