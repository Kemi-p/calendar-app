export interface Holiday {
  name: string;
  date: string;
  observed: string;
  public: boolean;
  country: string;
  uuid: string;
}

export interface HolidayApiResponse {
  status: number;
  holidays: Holiday[];
}
