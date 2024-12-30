import { HttpEvent, HttpHandlerFn, HttpHeaders, HttpRequest } from "@angular/common/http";
import { Observable } from "rxjs";

export function authInterceptor (req: HttpRequest<unknown>, next: HttpHandlerFn) : Observable<HttpEvent<unknown>>{
    let token = "";

    // Récupération des infos de connexion de l'utilisateur au niveau du localStorage
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
        const infos = JSON.parse(localStorage.getItem('token') || "{}");
        if (infos && infos.token) {  // Utilisation de infos.token
            token = infos.token;
        }
    }

    // S'il n'y a pas de token, on retourne la requête d'origine
    if (!token) {
        return next(req);
    }

    // Ajout du token à l'en-tête Authorization
    const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
    });

    // Clonage de la requête en y ajoutant les en-têtes
    const newReq = req.clone({
        headers
    });

    // On retourne la nouvelle requête clonée
    return next(newReq);
}
