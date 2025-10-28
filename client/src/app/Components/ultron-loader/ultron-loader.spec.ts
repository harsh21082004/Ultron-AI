import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UltronLoader } from './ultron-loader';

describe('UltronLoader', () => {
  let component: UltronLoader;
  let fixture: ComponentFixture<UltronLoader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UltronLoader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UltronLoader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
