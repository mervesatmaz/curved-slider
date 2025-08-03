export interface SliderItem {
  id: string;
  title: string;        // Add this new field
  text: string;
  image: string;
  isLocalFile: boolean;
  imageFileName?: string;
}