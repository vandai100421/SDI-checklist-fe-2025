
export const statementUpdateUser =
  "UPDATE `User` SET `email` = $email,`name` = $name,`company` = $company,`username` = $username,`password` = $password, `status` = 'pending-update' WHERE (`id` = $id);";
