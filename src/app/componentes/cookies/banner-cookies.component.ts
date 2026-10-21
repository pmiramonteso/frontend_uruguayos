import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CookiesService } from '../../service/cookies.service';

@Component({
    selector: 'app-banner-cookies',
    imports: [RouterModule],
    templateUrl: './banner-cookies.component.html',
    changeDetection: ChangeDetectionStrategy.Eager
})
export class BannerCookiesComponent {
  constructor(public cookies: CookiesService) {}
}
