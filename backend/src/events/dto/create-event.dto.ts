export class CreateEventDto {
  title: string;
  description?: string;
  location?: string;
  startDate: string | Date;
  endDate?: string | Date;
}
