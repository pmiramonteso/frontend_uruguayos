import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CookiesService } from '../../service/cookies.service';
import { FooterComponent } from '../footer/footer.component';

@Component({
    selector: 'app-politica-cookies',
    imports: [FooterComponent],
    templateUrl: './politica-cookies.component.html',
    changeDetection: ChangeDetectionStrategy.Eager
})
export class PoliticaCookiesComponent {
  constructor(public cookies: CookiesService) {}
}
