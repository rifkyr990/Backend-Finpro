import prisma from "../config/prisma";

interface AddressData {
  name: string;
  phone: string;
  label: string;
  province: string;
  province_id: string | null;
  city: string;
  city_id: string | null;
  district: string;
  district_id: string | null;
  subdistrict: string;
  subdistrict_id: string | null;
  postal_code: string;
  street: string;
  detail?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  is_primary?: boolean;
}

class UserAddressService {
  private static validateAddressData(data: Partial<AddressData>) {
    const requiredFields = [
      'name', 'phone', 'label', 'province', 'province_id',
      'city', 'city_id', 'district', 'district_id',
      'subdistrict', 'subdistrict_id', 'postal_code', 'street',
    ];
    const missingFields = requiredFields.filter(
      (field) => !data[field as keyof AddressData] && data[field as keyof AddressData] !== 0
    );
    if (missingFields.length > 0) {
      throw new Error(`Field berikut wajib diisi: ${missingFields.join(', ')}`);
    }
  }

  // tampil alamat
  public static async getAddress(userId: string) {
    return prisma.userAddress.findMany({
      where: { user_id: userId },
      orderBy: { is_primary: "desc" },
    });
  }

  // buat alamat
  public static async createAddress(userId: string, data: Partial<AddressData>) {
    this.validateAddressData(data);

    if (data.is_primary) {
      await prisma.userAddress.updateMany({
        where: { user_id: userId, is_primary: true },
        data: { is_primary: false },
      });
    }

    const province_id = data.province_id !== undefined && data.province_id !== null ? String(data.province_id) : null;
    const city_id = data.city_id !== undefined && data.city_id !== null ? String(data.city_id) : null;
    const district_id = data.district_id !== undefined && data.district_id !== null ? String(data.district_id) : null;
    const subdistrict_id = data.subdistrict_id !== undefined && data.subdistrict_id !== null ? String(data.subdistrict_id) : null;

    return prisma.userAddress.create({
      data: { user_id: userId, name: data.name!, phone: data.phone!, label: data.label!, province: data.province!, province_id, city: data.city!,city_id, district: data.district!, district_id, subdistrict: data.subdistrict!, subdistrict_id, postal_code: data.postal_code!, street: data.street!, detail: data.detail ?? null, latitude: data.latitude ?? null, longitude: data.longitude ?? null, is_primary: Boolean(data.is_primary),},
    });
  }

  public static async updateAddress(userId: string, id: number, data: Partial<AddressData>) {
    if (data.is_primary) {
      await prisma.userAddress.updateMany({
        where: { user_id: userId, is_primary: true },
        data: { is_primary: false },
      });
    }

    const updateData = {
      ...data,
      province_id: data.province_id !== undefined && data.province_id !== null ? String(data.province_id) : null,
      city_id: data.city_id !== undefined && data.city_id !== null ? String(data.city_id) : null,
      district_id: data.district_id !== undefined && data.district_id !== null ? String(data.district_id) : null,
      subdistrict_id: data.subdistrict_id !== undefined && data.subdistrict_id !== null ? String(data.subdistrict_id) : null,
      is_primary: Boolean(data.is_primary),
    };

    return prisma.userAddress.update({
      where: { id },
      data: updateData,
    });
  }

  public static async setPrimaryAddress(userId: string, addressId: number) {
    const address = await prisma.userAddress.findUnique({
      where: { id: addressId },
    });

    if (!address || address.user_id !== userId) {
      throw new Error("Alamat tidak ditemukan");
    }

    await prisma.userAddress.updateMany({
      where: { user_id: userId },
      data: { is_primary: false },
    });

    const updated = await prisma.userAddress.update({
      where: { id: addressId },
      data: { is_primary: true },
    });

    return updated;
  }

  public static async deleteAddress(userId: string, id: number) {
    return prisma.userAddress.delete({ where: { id } });
  }
}

export default UserAddressService;
