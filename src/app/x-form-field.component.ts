import { Component, Input, AfterContentInit, OnDestroy, ContentChildren, QueryList, Attribute, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { FormControlName } from '@angular/forms';

@Component({
    selector: 'div[xFormField]',
    template: `
    <ng-content></ng-content>
    <ng-container *ngIf="errs$ | async as errorList">
        <span class="form-error" *ngIf="errorList[0]">{{ errorList[0] }}</span>
    </ng-container>`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class XFormFieldComponent implements AfterContentInit, OnDestroy {
    @ContentChildren(FormControlName, {descendants: true})
    c!: QueryList<FormControlName>;

    @Input('xFormField')
    errors: any = {};

    errs$: Subject<string[]|false> = new Subject();

    constructor(
        @Attribute('denyEmpty')
        public denyEmpty: any,
        public cdr: ChangeDetectorRef,
    ) {
        this.denyEmpty = (this.denyEmpty === '') || (this.denyEmpty === '1') || (this.denyEmpty === 'true');
    }

    ngAfterContentInit(): void {
        const registerListenFn: Function = (comp: any) => {
            const updateFn: Function = () => {
                if ((!comp.control.touched && !comp.control.dirty && comp.control.valid) || (!this.denyEmpty && !comp.control.value)) {
                    this.errs$.next(false);
                } else if (comp.control.pending || comp.control.valid || comp.control.disabled) {
                    this.errs$.next(false);
                } else {
                    const errs = [];
                    for (let error in this.errors) {
                        if (comp.control.hasError(error)) {
                            errs.push(this.errors[error]);
                        }
                    }
                    this.errs$.next(errs);
                }
            };
            comp.control.valueChanges.subscribe(updateFn);
            comp.control.statusChanges.subscribe(updateFn);
            updateFn();
        };
        this.c.forEach(comp => registerListenFn(comp));
        this.c.changes.subscribe(_ => this.c.forEach(comp => registerListenFn(comp)));
        this.errs$.pipe(distinctUntilChanged()).subscribe(() => {
            this.cdr.detectChanges();
        });
    }

    ngOnDestroy(): void {
        this.errs$.complete();
    }
}
