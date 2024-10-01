import { Pipe, PipeTransform } from "@angular/core";

@Pipe({name: "alignSendMusicButton", pure: true})
export class AlignSendMusicButtonPipe implements PipeTransform {
  transform(width: number): any {
    console.log(width);
    if(width < 1090)
    return { right: "90px" , top: "4%"};
  }
}