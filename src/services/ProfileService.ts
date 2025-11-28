import { ProfileModel } from "../models/ProfileModel"

export const ProfileService = {
  async createProfile(userId: number, data: any) {
    const existing = await ProfileModel.findByUserId(userId)
 
    if (existing) throw new Error("Profile already exists")
    const profile = await ProfileModel.create({
      ...data,
      userId,
    })
    return profile
  },

  async getProfile(userId: number) {
    const profile = await ProfileModel.findByUserId(userId)
    if (!profile) throw new Error("Profile not found")
    return profile
  },

  async updateProfile(userId: number, data: any) {
    const existing = await ProfileModel.findByUserId(userId)
    if (!existing) throw new Error("Profile not found")

    const updated = await ProfileModel.update(userId, data)
    return updated
  },

  async deleteProfile(userId: number) {
    const existing = await ProfileModel.findByUserId(userId)
    if (!existing) throw new Error("Profile not found")

    await ProfileModel.delete(userId)
    return { message: "Profile deleted" }
  },

  async listAllProfiles() {
    return await ProfileModel.getAll()
  }
}
