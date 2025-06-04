import { User } from "./store/models/user";

export const getProfilePicture = (user: User) => {
  if (user.profile_picture) return user.profile_picture;

  const firstLetter = user?.username?.charAt(0)?.toUpperCase();
  const colors = [
    "FF5733",
    "33FF57",
    "3357FF",
    "FF33A1",
    "33FFF2",
    "A133FF",
    "FFDB33",
    "33A1FF",
  ];
  const colorIndex = user.id % colors.length;
  return `https://ui-avatars.com/api/?name=${firstLetter}&background=${colors[colorIndex]}`;
};
