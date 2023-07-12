import { client } from "../../graphql";
import { REFRESH_TOKEN, LOGIN_ADMIN } from "../mutations";

export const refreshToken = async (refresh_token) => {
  try {
    const { data } = await client.mutate({
      mutation: REFRESH_TOKEN,
      context: { accessToken: refresh_token },
    });
    return {
      error: false,
      data: data?.refreshToken,
    };
  } catch (error) {
    return {
      error: true,
      data: error.message,
    };
  }
};

/* export const loginAdmin = async (variables) => {
  try {
    const data = await client.mutate({
      mutation: LOGIN_ADMIN,
      variables,
    });
    console.log(data);

    return {
      error: false,
      data: data?.loginAdmin,
    };
  } catch (error) {
    return {
      error: true,
      data: error.message,
    };
  }
} */ export const loginAdmin = async () => {
  try {
    const { data } = await client.query({
      query: LOGIN_ADMIN,
    });
    return {
      error: false,
      data: data?.helloWorld,
    };
  } catch (error) {
    return {
      error: true,
      data: error.message,
    };
  }
};
