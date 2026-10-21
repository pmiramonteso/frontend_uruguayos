import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CookiesService } from '../../service/cookies.service';

@Component({
    selector: 'app-footer',
    imports: [RouterModule],
    templateUrl: './footer.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './footer.component.scss'
})
export class FooterComponent {
  constructor(public cookies: CookiesService) {}
}
