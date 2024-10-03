import { Pipe, PipeTransform } from "@angular/core";

@Pipe({name: "alignSendButton", pure: true})
export class AlignSendButtonPipe implements PipeTransform {
  transform(width: number): any {
    console.log(width);
    if(width < 1090)
    return { right: "10px" , top: "2%"};
  }
}