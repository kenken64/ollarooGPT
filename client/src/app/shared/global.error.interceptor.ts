import {ErrorHandler, Injectable} from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class CustomErrorHandlerService extends ErrorHandler {

    constructor(private router:Router) {
        super();
    }

    override handleError(error: any) {
        console.log(error);
        super.handleError(error);
        this.router.navigate(['']);
    }
}