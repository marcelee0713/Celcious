export type UserWithoutPass = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  emailVerified: Date | null;
  image: string | null;
  address_one: string | null;
  address_two: string | null;
};

export type photoUrl = {
  url: string;
};
