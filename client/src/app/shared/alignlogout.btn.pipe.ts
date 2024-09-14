import { Pipe, PipeTransform } from "@angular/core";

@Pipe({name: "alignLogoutButton", pure: true})
export class AlignLogoutButtonPipe implements PipeTransform {
  transform(width: number): any {
    console.log(width);
    if(width < 1090)
    return { right: "140px" , top: "4%"};
  }
}