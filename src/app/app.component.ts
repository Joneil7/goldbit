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
            'countTanks': new UntypedFormControl(null, [ Validators.required,
                Validators.min(0) ]),
            'tanksShare': new UntypedFormControl(1, [ Validators.required,
                Validators.min(0), Validators.max(100) ]),
            'countTopDpsHps': new UntypedFormControl(null, [ Validators.required,
                Validators.min(0) ]),
            'topDpsHpsShare': new UntypedFormControl(0.5, [ Validators.required,
                Validators.min(0), Validators.max(100) ]),
        });
    }

    createMinusBlock(index = 0) {
        if (!this.fg.contains('minusPlayers')) {
            this.fg.addControl('minusPlayers', new UntypedFormGroup({
                ['countMinus' + index]: new UntypedFormControl(null, [ Validators.required,
                    Validators.min(0) ]),
                ['percentMinus' + index]: new UntypedFormControl(10, [ Validators.required,
                    Validators.min(0), Validators.max(100) ]),
            }));
        } else {
            // @ts-ignore
            this.fg.controls['minusPlayers'].addControl(['countMinus' + index], new UntypedFormControl(null, [ Validators.required,
                Validators.min(0) ]));
            // @ts-ignore
            this.fg.controls['minusPlayers'].addControl(['percentMinus' + index], new UntypedFormControl(10, [ Validators.required,
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
        const rlShare = fg.value.rlShare / 100 * bank;
        bank = bank - rlShare;
        let html = `
            <div>Банк: ${defBank} голд</div>
            <div>Доля РЛА: ${rlShare} голд</div>
        `;
        // Расчет доли танков и ДД/Хилов
        const tanksShare = fg.value.tanksShare / 100 * bank;
        const topDpsHpsShare = fg.value.topDpsHpsShare / 100 * bank;
        bank = bank - (countTopDpsHps * topDpsHpsShare) - (countTanks * tanksShare);
        // Расчет доли для всех
        const defPlayersShare = bank / raiders;
        // Расчет доли штрафников
        const minusPlayers = fg.value.minusPlayers;
        const minusObj: any = {};
        const getTanksTopDpsHps = (share: number) => {
            if (countTanks) {
                html += `
                <div>Доля Танка(ов): ${tanksShare + share} голд</div>
            `;
            }
            if (countTopDpsHps) {
                html += `
            <div>Доля ТОП ДПС/ХПС: ${topDpsHpsShare + share} голд</div>
        `;
            }
        }
        if (this.countMinus.length) {
            let allPunishShare = 0;
            let allPunishPlayers = 0;
            let minusHtml = '';
            for (let key of this.countMinus) {
                let count = minusPlayers['countMinus'+key];
                let percent = minusPlayers['percentMinus'+key];
                minusObj[percent] = {
                    count,
                    percent
                }
                allPunishShare += (defPlayersShare - (percent / 100 * defPlayersShare)) * count;
                allPunishPlayers += count;
                const share = defPlayersShare - (percent / 100 * defPlayersShare);
                minusHtml += `
                    <div>Доля игрока с штрафом -${percent}%: ${share} голд</div>
                `;
            }
            const totPlayersShare = (bank - allPunishShare) / (raiders - allPunishPlayers);
            getTanksTopDpsHps(totPlayersShare);
            html += `
                <div>Доля рейдера(без минусов): ${totPlayersShare} голд</div>
            ` + minusHtml;
        } else {
            getTanksTopDpsHps(defPlayersShare);
            html += `
                <div>Доля рейдера(без минусов): ${defPlayersShare} голд</div>
            `;
        }
        this.result = html;
    }

    clear() {
        this.fg = this.fgInit();
        this.cdr.detectChanges();
    }
}
