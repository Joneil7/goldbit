import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {

    public fg!: UntypedFormGroup;
    public countMinus: any[] = [];
    public result: string = '';

    constructor(
        private cdr: ChangeDetectorRef
    ) {
    }

    ngOnInit() {
        this.fg = this.fgInit();
        this.cdr.detectChanges();
    }

    fgInit() {
        return new UntypedFormGroup({
            'bank': new UntypedFormControl(null, [ Validators.required,
                Validators.min(1) ]),
            'raiders': new UntypedFormControl(25, [ Validators.required,
                Validators.min(1) ]),
            'rlShare': new UntypedFormControl(10, [ Validators.required,
                Validators.min(0), Validators.max(100) ]),
            'countTanks': new UntypedFormControl(0, [ Validators.required,
                Validators.min(0) ]),
            'tanksShare': new UntypedFormControl(1, [ Validators.required,
                Validators.min(0), Validators.max(100) ]),
            'countTopDpsHps': new UntypedFormControl(0, [ Validators.required,
                Validators.min(0) ]),
            'topDpsHpsShare': new UntypedFormControl(0.5, [ Validators.required,
                Validators.min(0), Validators.max(100) ])
        });
    }

    createMinusBlock(index = 0) {
        if (!this.fg.contains('minusPlayers')) {
            this.fg.addControl('minusPlayers', new UntypedFormGroup({
                ['namesMinus' + index]: new UntypedFormControl(0, [ Validators.required,
                    Validators.min(0) ]),
                ['percentMinus' + index]: new UntypedFormControl(10, [ Validators.required,
                    Validators.min(0), Validators.max(100) ])
            }));
        } else {
            // @ts-ignore
            this.fg.controls['minusPlayers'].addControl([ 'namesMinus' + index ], new UntypedFormControl(null, [ Validators.required ]));
            // @ts-ignore
            this.fg.controls['minusPlayers'].addControl([ 'percentMinus' + index ], new UntypedFormControl(10, [ Validators.required,
                Validators.min(0), Validators.max(100) ]));
        }
        this.countMinus.push(index);
        this.cdr.detectChanges();
    }

    submit(fg: UntypedFormGroup) {
        if (fg.invalid) {
            return;
        }
        const defBank = fg.value.bank;
        let bank = fg.value.bank;
        const raiders = fg.value.raiders;
        const countTopDpsHps = fg.value.countTopDpsHps;
        const countTanks = fg.value.countTanks;
        // Расчет доли рла
        const rlShare = Math.round(fg.value.rlShare / 100 * bank);
        bank = bank - rlShare;
        let html = `
            <div><b>Банк:</b> ${ defBank } голд.</div>
            <div><b>Доля РЛА:</b> ${ rlShare } голд.</div>
        `;
        // Расчет доли танков и ДД/Хилов
        const tanksShare = Math.round(fg.value.tanksShare / 100 * bank);
        const topDpsHpsShare = Math.round(fg.value.topDpsHpsShare / 100 * bank);
        bank = bank - (countTopDpsHps * topDpsHpsShare) - (countTanks * tanksShare);
        // Расчет доли для всех
        const defPlayersShare = Math.round(bank / raiders);
        // Расчет доли штрафников
        const minusPlayers = fg.value.minusPlayers;
        const getTanksTopDpsHps = (share: number) => {
            if (countTanks) {
                html += `
                <div><b>Доля Танка(ов):</b> ${ tanksShare + share } голд.</div>
            `;
            }
            if (countTopDpsHps) {
                html += `
            <div><b>Доля ТОП ДПС/ХПС:</b> ${ topDpsHpsShare + share } голд.</div>
        `;
            }
        };
        if (this.countMinus.length) {
            let allPunishShare = 0;
            let allPunishPlayers = 0;
            let minusHtml = '';
            for (let key of this.countMinus) {
                let names = minusPlayers['namesMinus' + key].split(' ');
                let count = names.length;
                let percent = minusPlayers['percentMinus' + key];
                allPunishShare += (defPlayersShare - (percent / 100 * defPlayersShare)) * count;
                allPunishPlayers += count;
                const share = Math.round(defPlayersShare - (percent / 100 * defPlayersShare));
                minusHtml += `
                    <div><b>Доля игрока с штрафом -${ percent }% (${ names.join(', ') }):</b> ${ share } голд.</div>
                `;
            }
            const totPlayersShare = Math.round((bank - allPunishShare) / (raiders - allPunishPlayers));
            getTanksTopDpsHps(totPlayersShare);
            html += `
                <div><b>Доля рейдера(без минусов):</b> ${ totPlayersShare } голд.</div>
            ` + minusHtml;
        } else {
            getTanksTopDpsHps(defPlayersShare);
            html += `
                <div><b>Доля рейдера(без минусов):</b> ${ defPlayersShare } голд.</div>
            `;
        }
        this.result = html;
    }

    clear() {
        this.fg = this.fgInit();
        this.countMinus = [];
        this.result = '';
        this.cdr.detectChanges();
    }
}
