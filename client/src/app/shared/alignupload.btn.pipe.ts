import { Pipe, PipeTransform } from "@angular/core";

@Pipe({name: "alignUploadButton", pure: true})
export class AlignUploadButtonPipe implements PipeTransform {
  transform(width: number): any {
    console.log(width);
    if(width < 1090)
    return { right: "50px" , top: "4%"};
  }
}