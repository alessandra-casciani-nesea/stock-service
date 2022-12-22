import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Observable } from "rxjs";

export class ApiInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const modifiedReq = req.clone({
            url: "https://finnhub.io/api/v1" + req.url,
            setParams: {
                'token': 'bu4f8kn48v6uehqi3cqg'
            }
        });
        return next.handle(modifiedReq);
    }
}
