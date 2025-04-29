import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { CustomerManager } from '../src/huntersManager.js';
import { Hunter, HunterDocumentInterface } from '../src/hunters.js';

vi.mock('./hunters.js', () => {
  const mockHunter = vi.fn();
  mockHunter.prototype.save = vi.fn();
  
  return {
    Hunter: vi.fn().mockImplementation((data) => {
      return {
        ...data,
        _id: 'mock-id-' + Math.random().toString(36).substr(2, 9),
        save: mockHunter.prototype.save
      };
    })
  };
});

describe('CustomerManager', () => {
  let manager: CustomerManager;
  
  beforeEach(() => {
    manager = new CustomerManager();
    
    vi.clearAllMocks();
    
    Hunter.findById = vi.fn();
    Hunter.findOne = vi.fn();
    Hunter.findByIdAndUpdate = vi.fn();
    Hunter.findOneAndUpdate = vi.fn();
    Hunter.findByIdAndDelete = vi.fn();
    Hunter.findOneAndDelete = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test('addCustomer debe crear y guardar un nuevo cazador', async () => {
    const saveMock = vi.fn().mockResolvedValue(true);
    vi.mocked(Hunter).mockImplementation((data) => {
      return {
        ...data,
        _id: 'mock-id-123',
        save: saveMock
      };
    });

    const result = await manager.addCustomer('Geralt', 'Elf', 'Rivia');

    expect(Hunter).toHaveBeenCalledWith({ name: 'Geralt', race: 'Elf', location: 'Rivia' });
    expect(saveMock).toHaveBeenCalled();
    expect(result).toMatchObject({
      name: 'Geralt',
      race: 'Elf',
      location: 'Rivia'
    });
  });

  test('findCustomerById debe buscar un cazador por ID', async () => {
    const mockHunter = { _id: 'some-id', name: 'Geralt', race: 'Elf', location: 'Rivia' } as HunterDocumentInterface;
    
    vi.mocked(Hunter.findById).mockResolvedValue(mockHunter);

    const result = await manager.findCustomerById('some-id');

    expect(Hunter.findById).toHaveBeenCalledWith('some-id');
    expect(result).toEqual(mockHunter);
  });

  test('findCustomerByName debe buscar un cazador por nombre', async () => {
    const mockHunter = { _id: 'some-id', name: 'Geralt', race: 'Elf', location: 'Rivia' } as HunterDocumentInterface;

    vi.mocked(Hunter.findOne).mockResolvedValue(mockHunter);

    const result = await manager.findCustomerByName('Geralt');

    expect(Hunter.findOne).toHaveBeenCalledWith({ name: 'Geralt' });
    expect(result).toEqual(mockHunter);
  });

  test('updateCustomerById debe actualizar un cazador por ID', async () => {
    const mockHunter = { _id: 'some-id', name: 'Geralt', race: 'Elf', location: 'Kaer Morhen' } as HunterDocumentInterface;
    const updateData = { location: 'Novigrad' };

    vi.mocked(Hunter.findByIdAndUpdate).mockResolvedValue({ ...mockHunter, ...updateData } as HunterDocumentInterface);

    const result = await manager.updateCustomerById('some-id', updateData);

    expect(Hunter.findByIdAndUpdate).toHaveBeenCalledWith('some-id', updateData, { new: true });
    expect(result).toEqual({ ...mockHunter, ...updateData });
  });

  test('updateCustomerByName debe actualizar un cazador por nombre', async () => {
    const mockHunter = { _id: 'some-id', name: 'Geralt', race: 'Elf', location: 'Rivia' } as HunterDocumentInterface;
    const updateData = { location: 'Toussaint' };

    vi.mocked(Hunter.findOneAndUpdate).mockResolvedValue({ ...mockHunter, ...updateData } as HunterDocumentInterface);

    const result = await manager.updateCustomerByName('Geralt', updateData);

    expect(Hunter.findOneAndUpdate).toHaveBeenCalledWith({ name: 'Geralt' }, updateData, { new: true });
    expect(result).toEqual({ ...mockHunter, ...updateData });
  });

  test('removeCustomerById debe eliminar un cazador por ID', async () => {
    const mockHunter = { _id: 'some-id', name: 'Geralt', race: 'Elf', location: 'Rivia' } as HunterDocumentInterface;

    vi.mocked(Hunter.findByIdAndDelete).mockResolvedValue(mockHunter);

    const result = await manager.removeCustomerById('some-id');

    expect(Hunter.findByIdAndDelete).toHaveBeenCalledWith('some-id');
    expect(result).toEqual(mockHunter);
  });

  test('removeCustomerByName debe eliminar un cazador por nombre', async () => {
    const mockHunter = { _id: 'some-id', name: 'Geralt', race: 'Elf', location: 'Rivia' } as HunterDocumentInterface;

    vi.mocked(Hunter.findOneAndDelete).mockResolvedValue(mockHunter);

    const result = await manager.removeCustomerByName('Geralt');

    expect(Hunter.findOneAndDelete).toHaveBeenCalledWith({ name: 'Geralt' });
    expect(result).toEqual(mockHunter);
  });

  test('findCustomerById debe devolver null cuando no se encuentra el cazador', async () => {
    vi.mocked(Hunter.findById).mockResolvedValue(null);

    const result = await manager.findCustomerById('non-existent-id');

    expect(Hunter.findById).toHaveBeenCalledWith('non-existent-id');
    expect(result).toBeNull();
  });

  test('findCustomerByName debe devolver null cuando no se encuentra el cazador', async () => {
    vi.mocked(Hunter.findOne).mockResolvedValue(null);

    const result = await manager.findCustomerByName('Non-existent name');

    expect(Hunter.findOne).toHaveBeenCalledWith({ name: 'Non-existent name' });
    expect(result).toBeNull();
  });

  test('addCustomer debe manejar errores de guardado', async () => {
    const errorMsg = 'Error saving to database';
    vi.mocked(Hunter).mockImplementation(() => ({
      save: vi.fn().mockRejectedValue(new Error(errorMsg))
    }));

    await expect(manager.addCustomer('Geralt', 'Elf', 'Rivia'))
      .rejects
      .toThrow(errorMsg);
  });
});