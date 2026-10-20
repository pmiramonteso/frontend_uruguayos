import { Component, ChangeDetectionStrategy } from '@angular/core';
import { GraficosAdminComponent } from '../admin/graficos-admin/graficos-admin.component';

@Component({
    selector: 'app-graficos',
    imports: [GraficosAdminComponent],
    templateUrl: './graficos.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './graficos.component.scss'
})
export class GraficosComponent {

}
