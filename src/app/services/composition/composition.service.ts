import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { AppConfig } from '../../config/config';


@Injectable({
  providedIn: 'root'
}) 
export class CompositionService {

  constructor(
    private httpClient : HttpClient,
  ) {}

  private apiUrl = 'https://the-academia-nestapi.onrender.com/composition';
  private apiUrlMendel = AppConfig.apiUrl;

  isAble(): Observable<any> {
    return this.httpClient.get<any>(this.apiUrl);
  }
  
  showInfoEp(id_epreuve: number) : Observable<any>{
    const url = `${this.apiUrlMendel}/epreuves/${id_epreuve}`;

    console.log("Appel API pour getEpreuvesByProfesseurId:", url);
    return this.httpClient.get<any>(url);
  }

  showQuesByEp(id_epreuve: number) : Observable<any>{
    const url = `${this.apiUrlMendel}/questions/showQuesByEp/${id_epreuve}`;
    return this.httpClient.get<any>(url)
  }
  
  creerCopie(copiePayload: any): Observable<any> {
    const url = `${this.apiUrlMendel}/copies`;
    return this.httpClient.post<any>(url, copiePayload);
  }
  
  corrigerCopie(id_copie: number): Observable<any> {
    const url = `${this.apiUrlMendel}/corrections/copies/${id_copie}/corriger`;
    return this.httpClient.post<any>(url, {});
  }

    creerReponse(reponse: any): Observable<any> {
      return this.httpClient.post<any>(`${this.apiUrlMendel}/reponses`, reponse);
    }
  
    lireReponse(id_reponse: number): Observable<any> {
      return this.httpClient.get<any>(`${this.apiUrlMendel}/${id_reponse}`);
    }
  
    lireToutesLesReponses(): Observable<any> {
      return this.httpClient.get<any>(this.apiUrlMendel);
    }

    soumettreCopie(copie: {
      id_etudiant: number,
      id_epreuve: number,
      reponses_qcm: { [id_question: number]: string },
      reponses_code: string[],
      reponses_courtes: string[]
    }): Observable<any> {
      const url = `${this.apiUrlMendel}/copies/soumettre_copie`;
      return this.httpClient.post<any>(url, copie);
    }
    

}