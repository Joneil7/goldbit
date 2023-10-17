import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {

    public fg!: UntypedFormGroup;
    public countMinus: any[] = [ 0 ];

    public defBank = 0;
    public rlShare = 0;
    public tanksShare = 0;
    public topDpsHpsShare = 0;
    public tanksBonus = 0;
    public topDpsHpsBonus = 0;
    public raidersShare = 0;
    public raidersBonus = 0;

    public punishPlayers: any[] = [];

    constructor(
        private cdr: ChangeDetectorRef
    ) {
    }

    ngOnInit() {
        this.fg = new UntypedFormGroup({
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
                Validators.min(0), Validators.max(100) ]),
            'minusPlayers': new UntypedFormGroup({
                ['nameMinus0']: new UntypedFormControl(null),
                ['percentMinus0']: new UntypedFormControl(10, [ Validators.required,
                    Validators.min(0), Validators.max(100) ])
            })
        });
        this.cdr.detectChanges();
    }

    addMinusPlayer(index: number) {
        // @ts-ignore
        this.fg.controls['minusPlayers'].addControl([ 'nameMinus' + index ], new UntypedFormControl(null));
        // @ts-ignore
        this.fg.controls['minusPlayers'].addControl([ 'percentMinus' + index ], new UntypedFormControl(10, [ Validators.required,
            Validators.min(0), Validators.max(100) ]));
        this.countMinus.push(index);
        this.cdr.detectChanges();
    }

    submit(fg: UntypedFormGroup) {
        if (fg.invalid) {
            return;
        }
        this.punishPlayers = [];
        this.defBank = fg.value.bank;
        let bank = fg.value.bank;
        const raiders = fg.value.raiders;
        const countTopDpsHps = fg.value.countTopDpsHps;
        const countTanks = fg.value.countTanks;
        // Расчет доли рла
        this.rlShare = Math.round(fg.value.rlShare / 100 * bank);
        bank = bank - this.rlShare;
        // Расчет доли танков и ДД/Хилов
        this.tanksBonus = Math.round(fg.value.tanksShare / 100 * bank);
        this.topDpsHpsBonus = Math.round(fg.value.topDpsHpsShare / 100 * bank);
        bank = bank - (countTopDpsHps * this.topDpsHpsBonus) - (countTanks * this.tanksBonus);
        // Расчет доли для всех
        const defPlayersShare = Math.round(bank / raiders);
        // Расчет доли штрафников
        const minusPlayers = fg.value.minusPlayers;
        const getTanksTopDpsHps = (share: number) => {
            if (countTanks) {
                this.tanksShare = this.tanksBonus + share;
            }
            if (countTopDpsHps) {
                this.topDpsHpsShare = this.topDpsHpsBonus + share;
            }
        };
        let totPunishShare = 0;
        let countPunishPlayers = 0;
        let isMinus = true;
        for (let key of this.countMinus) {
            let name = minusPlayers['nameMinus' + key];
            let percent = minusPlayers['percentMinus' + key];
            if (!name) {
                if (key == 0) {
                    isMinus = false;
                }
                break;
            }
            countPunishPlayers++;
            let punish = Math.round(percent / 100 * defPlayersShare);
            // Доля штрафника
            const share = Math.round(defPlayersShare - punish);
            totPunishShare += share;
            let obj = {
                name,
                share,
                punish
            };
            this.punishPlayers.push(obj);
        }
        if (isMinus) {
            this.raidersBonus = Math.round(totPunishShare / (raiders - countPunishPlayers));
            const totPlayersShare = Math.round((bank - totPunishShare) / (raiders - countPunishPlayers));
            getTanksTopDpsHps(totPlayersShare);
            this.raidersShare = totPlayersShare;
        } else {
            getTanksTopDpsHps(defPlayersShare);
            this.raidersShare = defPlayersShare;
        }
        this.cdr.detectChanges();
    }

    clear() {
        this.fg.setValue({
            bank: null,
            raiders: 25,
            rlShare: 10,
            countTanks: 0,
            tanksShare: 1,
            countTopDpsHps: 0,
            topDpsHpsShare: 0.5,
            minusPlayers: {
                nameMinus0: null,
                percentMinus0: 10
            }
        })
        this.fg.setErrors(null);
        this.countMinus = [ 0 ];
        this.punishPlayers = [];
        this.defBank = 0;
        this.rlShare = 0;
        this.tanksShare = 0;
        this.topDpsHpsShare = 0;
        this.tanksBonus = 0;
        this.topDpsHpsBonus = 0;
        this.raidersShare = 0;
        this.raidersBonus = 0;
        this.cdr.detectChanges();
    }
}
