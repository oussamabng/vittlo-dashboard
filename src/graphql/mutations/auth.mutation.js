import { gql } from "@apollo/client";

export const REFRESH_TOKEN = gql`
  mutation RefreshToken {
    refreshToken {
      access_token
      refresh_token
    }
  }
`;

export const LOGIN_ADMIN = gql`
  mutation LoginAdmin($input: LoginAdmin!) {
    loginAdmin(input: $input) {
      access_token
      refresh_token
    }
  }
`;

export const CREATE_DELIVERY = gql`
  mutation CreateDelivery($input: CreateDeliveryDto!) {
    createDelivery(input: $input) {
      id
      adress
      carColor
      carModel
      dateOfBirth
      email
      licensePlate
      phoneNumber
      status
      createdAt
      updatedAt
      role
    }
  }
`;

export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderDto!) {
    createOrder(input: $input) {
      id
      createdAt
      delivery {
        id
      }
      deliveryFees
      destinationLat
      destinationLong
      productName
      productPrice
      shippingAddress
      status
      trackingCode
      updatedAt
    }
  }
`;

export const UPDATE_STATUS_DELIVERY = gql`
  mutation UpdateStatusDelivery($userId: Float!, $status: String!) {
    updateStatusDelivery(userId: $userId, status: $status) {
      id
    }
  }
`;
