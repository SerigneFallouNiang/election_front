import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddYoungComponent } from './add-young.component';

describe('AddYoungComponent', () => {
  let component: AddYoungComponent;
  let fixture: ComponentFixture<AddYoungComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddYoungComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddYoungComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
