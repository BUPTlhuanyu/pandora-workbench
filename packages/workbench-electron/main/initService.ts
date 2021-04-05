/**
 * @file 应用启动的时候需要启动的service
 */
import {IFileService} from 'services/files/files';

export default class CodeApplication {
    constructor(
        @IFileService private readonly fileService: IFileService,
    ) {
        
    }
}
