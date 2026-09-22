import mongoose, { Schema, Document } from 'mongoose';

export interface IAppSetting extends Document {
  key: string;
  emmaAutoReplyEnabled: boolean;
  updatedAt: Date;
  createdAt: Date;
}

const AppSettingSchema: Schema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    emmaAutoReplyEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const AppSettingModel =
  mongoose.models.AppSetting || mongoose.model<IAppSetting>('AppSetting', AppSettingSchema);

export default AppSettingModel as mongoose.Model<IAppSetting>;
