import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalModelComponent } from './local-model.component';

describe('LocalModelComponent', () => {
  let component: LocalModelComponent;
  let fixture: ComponentFixture<LocalModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LocalModelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocalModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
