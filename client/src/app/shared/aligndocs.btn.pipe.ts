import { Pipe, PipeTransform } from "@angular/core";

@Pipe({name: "alignDocsButton", pure: true})
export class AlignDocsButtonPipe implements PipeTransform {
  transform(width: number): any {
    console.log(width);
    if(width < 1090)
    return { right: "125px" , top: "4%"};
  }
}