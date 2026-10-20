import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';

@Component({
    selector: 'app-presentacion',
    imports: [FooterComponent],
    templateUrl: './presentacion.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './presentacion.component.scss'
})
export class PresentacionComponent {

}
