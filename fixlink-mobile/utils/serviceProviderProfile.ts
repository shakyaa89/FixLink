export const isServiceProviderProfileComplete = (user: any) => {
  return Boolean(
    user &&
      user.role === "serviceProvider" &&
      user.verificationProofURL &&
      user.idProofURL &&
      user.providerCategory &&
      user.address
  );
};
