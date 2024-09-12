import { TestBed } from '@angular/core/testing';

import { OllamaService } from './ollama.service';

describe('OllamaService', () => {
  let service: OllamaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OllamaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
