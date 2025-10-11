import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PinkButton } from './pink-button';

describe('PinkButton', () => {
  let component: PinkButton;
  let fixture: ComponentFixture<PinkButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PinkButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PinkButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
