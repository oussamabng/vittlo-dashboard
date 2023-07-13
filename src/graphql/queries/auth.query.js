import { gql } from "@apollo/client";

export const HELLO = gql`
  query Query {
    helloWorld
  }
`;

export const GET_DELIVERY_USERS = gql`
  query Query($pagination: PaginationDto!, $search: SearchDto!) {
    getAllDeliveryUsers(pagination: $pagination, search: $search) {
      items {
        id
        email
        dateOfBirth
        createdAt
        carModel
        carColor
        adress
        licensePlate
        phoneNumber
        role
        status
        updatedAt
      }
      currentPage
      hasNextPage
      totalCount
      totalPages
    }
  }
`;

export const GET_ORDERS = gql`
  query Orders($pagination: PaginationDto!, $search: SearchDto!) {
    orders(pagination: $pagination, search: $search) {
      currentPage
      hasNextPage
      totalPages
      totalCount
      items {
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
  }
`;

export const GET_TRACKING_ORDER = gql`
  query OrderTracking($orderId: Int!) {
    orderTracking(order_id: $orderId) {
      status
      createdAt
      delivery {
        id
      }
      mission {
        startingAdress
        endingAdress
      }
    }
  }
`;

export const GET_MISSIONS = gql`
  query PaginatedMissions($pagination: PaginationDto!, $search: SearchDto!) {
    paginatedMissions(pagination: $pagination, search: $search) {
      numberOfOrders
      startingAdress
      endingAdress
      items {
        id
        startingAdress
        endingAdress
        numberOfOrders
        status
        delivery {
          email
        }
        tracking {
          id
          status
          currentPlace
          createdAt
        }
      }
    }
  }
`;
