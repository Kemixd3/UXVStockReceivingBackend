# UXV Stock Receiving WebApp x KEA

### [Link to page](https://uxvstocksystem.azurewebsites.net/)

### [Link to frontend repository](https://github.com/Kemixd3/NoteManager/tree/develop)

## Installations guide

## Getting Started - Frontend Setup

1. **Installation of Dependencies**:
   ```bash
   git clone <repository-url>
   cd ViteApp
   npm install
   ```

### Configuration of Environment Variables

- Create a `.env` file at the root of your project.
- Set the following environment variables:
  VITE_CLIENT_ID=<Your_Google_OAuth2_Client_ID>
  VITE_LOCALHOST=<Your_Express_API_Localhost_URL>

Replace `<our_Google_OAuth2_Client_ID>` with your OAuth client ID and `<Your_Express_API_Localhost_URL>` with your local development server URL.

## Scripts to run the App

- **Development**: "npm run dev" or npm run vite
- **Start**: "npm start" or vite
- **Build**: "npm run build" or vite build
- **Linting**: "npm run lint"

### Database Setup (if applicable)

The application uses a MySQL database and relies on the following tables:

- `batches`
- `batches_has_received_goods_items`
- `material`
- `purchase_order`
- `purchase_order_items`
- `received_goods`
- `received_goods_items`
- `users`

For testing purposes, we have provided a backup download of the database with test data from [this link](your-database-backup-link-here). Import this database backup into your MySQL server to have the necessary tables and sample data for your local setup or hosted instance.

Ensure the database connection details in your application match the configuration of your local MySQL server to interact with the database.

### Deployment

To deploy the application to different environments (development, staging, production) on Azure Web App, follow the steps below:

#### 1. Initial Setup

- Ensure that the necessary environment variables defined in your `.env` file are set in the Azure environment under connection strings.
- Configure your Azure Web App settings to include the required connection strings for your application.

#### 2. Deployment Process

- Access the Azure portal and navigate to your Web App resource.
- Select the deployment method that suits your workflow, such as GitHub Actions, Azure Pipelines, or manual deployment via the Azure portal.

#### 3. Deployment Command

For the application to function correctly on Azure Web App, it's crucial to start the application using the following command:

```bash
pm2 serve /home/site/wwwroot/dist --no-daemon --spa
```

This command is used to serve the application through PM2 on Azure Web App, ensuring the correct handling of SPA (Single Page Application) routing.

## Application Details

- **Name**: UXVStockReceiving
- **Version**: 0.1.0
- **Frontend Dependencies**: @emotion/react, @emotion/styled, @mui/material, @react-oauth/google, @reduxjs/toolkit, axios, bootstrap, dhtmlx-gantt, jsonwebtoken, jwt-decode, react, react-bootstrap, react-bootstrap-icons, react-dom, react-hook-form, react-router-dom, react-scripts, sass
- **Development Dependencies**: @babel/plugin-proposal-private-property-in-object, @types/react, @types/react-dom, @vitejs/plugin-react, @vitejs/plugin-react-swc, eslint, eslint-plugin-react, eslint-plugin-react-hooks, eslint-plugin-react-refresh, vite, vite-plugin-html

### Project Structure (File structure)

The project follows a typical structure for a React application, organized into several main directories:

- **components:** This directory mostly contains reusable UI components used in the application. Some of these components are modular and often encapsulate specific functionalities or UI elements, promoting reusability and maintainability like toggle.jsx.

- **Context:** This directory includes context providers or hooks used for state management or sharing data across components. Contexts help in managing global state, enabling components to access shared data without passing props explicitly.

- **Controller:** The Controller directory contains utility functions, API handlers, and logic responsible for managing data flow between the frontend and backend. It helps in abstracting business logic from the UI components.

- **pages:** The pages directory holds higher-level components or views that represent distinct pages or routes in the application. Each page consists sometimes of multiple components and defines the layout or structure of a specific URL route.

- **store:** The store directory in the application currently holds functions related to theme and const custom css.

### Files

- **App:** The `App.js` (or `App.jsx`) file serves as the entry point to the application. It handles authentication before you can access AuthenticatedView.jsx, routing and global components like headers or footers that manages the overall layout or structure of the app.

- **index:** The `index.js` (or `index.jsx`) file initializes the React application, rendering the root component into the DOM.

- **router:** The `router.jsx` file manages application routing, using React Router to define routes and map them to specific components.

### Styling file structure

The root of the applications contains a global App.scss but the individual .jsx pages and components are likely to have their own styling also.
Example: `Nav.jsx` own styling would be named `Nav.css` and be located in the same directory.

### Structure Overview

The folder structure aims for decent modularity and separation of concerns, promoting a bit separation between UI components, state management, data handling, and page layouts. This helps a bit with scalability, maintainability, and code readability by providing a somewhat clear structure for various aspects of the application. Adjustments or additional folders might be present based on specific project requirements or architectural choices.

### Acknowledgments

The development of this project has been facilitated by various third-party libraries and resources:

- **[@emotion/react](https://emotion.sh/docs/introduction):** A library for writing CSS styles with JavaScript.
- **[@emotion/styled](https://emotion.sh/docs/introduction):** A CSS-in-JS library for styling React components.

- **[@mui/material](https://mui.com/):** A React UI framework that implements Google's Material Design. Used to create a table inside `oversigt.jsx`

- **[@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google):** A library for implementing Google OAuth authentication in React applications.

- **[Axios](https://axios-http.com/):** A promise-based HTTP client for making HTTP requests in the browser and Node.js.

- **[Bootstrap](https://getbootstrap.com/):** A popular CSS framework for building responsive and mobile-first websites.

- **[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken):** A library for creating and verifying JSON Web Tokens (JWTs).

- **[React Bootstrap](https://react-bootstrap.github.io/):** Bootstrap components built with React.

- **[React Router DOM](https://reactrouter.com/web/guides/quick-start):** A routing library for React applications.

- **[React Scripts](https://www.npmjs.com/package/react-scripts):** A set of scripts and tools for creating React applications.

- **[Sass](https://sass-lang.com/):** A CSS extension language that helps with writing maintainable and scalable CSS code.

- **[Stream](https://www.npmjs.com/package/stream):** A readable stream implementation for Node.js.

- **[util](https://www.npmjs.com/package/util):** A Node.js core utility library for commonly used functions.

These libraries have played a crucial role in enabling various functionalities and enhancing the development experience of this project.




# API Documentation


## DELETE batch by id
```http
 DELETE /batches/:batch_id
```
Deletes a batch and associated items.


### Request:

#### Method: DELETE

Endpoint: /batches/:batch_id

#### Headers:

Authorization: Bearer Token



### Parameters:

batch_id (Path Parameter): ID of the batch to be deleted.

### Responses:


| Responses |        Meaning               |
| :--------  | :-------------------------------- |
| `200 OK`     | Batch and associated items deleted successfully.|
| `400 Bad Request`     | Missing batch_id parameter. |
| `404 Not Found`     | Batch not found. |

 

## PUT batch by id
```http
PUT /batches/:batch_id
```

Updates information about a batch.

### Request:

#### Method: PUT

Endpoint: /batches/:batch_id

#### Headers:

Authorization: Bearer Token

#### Body:

json

{
  "BatchName": "NewBatchName",
  "CreatedBy": "NewCreatedBy",
  "ReceivedGoodsID": "NewReceivedGoodsID",
  "SI_Date": "NewSIDate",
  "SINumber": "NewSINumber"
}

### Parameters:

batch_id (Path Parameter): ID of the batch to be updated.

### Responses:


| Responses |        Meaning               |
| :--------  | :-------------------------------- |
| `200 OK`     | Batch updated successfully.|
| `400 Bad Request`     | Missing batch_id parameter. |
| `404 Not Found`     | Batch not found. |

 





## GET Purchase Order Routes

```http
GET /purchase-orders
```



Gets a list of purchase orders with optional filtering.


### Request:

#### Method:
 GET

#### Endpoint: 
/purchase-orders

#### Headers:

Authorization: Bearer Token

#### Query Parameters:

page (Optional): Page number (default: 1).

limit (Optional): Number of items per page (default: 10).

org (Optional): Organization filter (e.g., "DK", "US").

### Responses:



| Responses |        Meaning               |
| :--------  | :-------------------------------- |
| `200 OK`     | List of purchase orders.|
| `500 Internal Server Error`     |Server error.|
| `404 Not Found`     | Batch not found. |

 


## GET purchase order items by orderId
```http
GET /purchase-order-items/:orderId
```

Gets the items associated with a specific purchase order.


### Request:

#### Method: 
GET

#### Endpoint:
 /purchase-order-items/:orderId

#### Headers:
##### Authorization:
 Bearer Token

#### Parameters:

orderId (Path Parameter): ID of the purchase order.

### Responses:


| Responses |        Meaning               |
| :--------  | :-------------------------------- |
| `200 OK`     | List of purchase order items.|
| `500 Internal Server Error`     |Server error.|
| `404 Not Found`     | Batch not found. |

 

## POST purchase order items
```http
POST /purchase-order-items
```

Adds items to a purchase order.

### Request:

#### Method: 
POST

#### Endpoint: 
/purchase-order-items

#### Headers:
Authorization: Bearer Token

#### Body:

json

{
  "orderId": "OrderID",
  "items": [
    {
      "Name": "ItemName",
      "Quantity": "Quantity",
      "SI_number": "SINumber",
      "type_id": "TypeID"
    }
  ]
}

### Responses:


| Responses |        Meaning               |
| :--------  | :-------------------------------- |
| `201 Created`     | Purchase order items added successfully.|
| `400 Bad Request`     |Invalid request body.|
| `500 Internal Server Error`     | Server error. |



## POST received goods
```http
POST /received-goods
```

Creates a new entry for received goods.

### Request:

#### Method: 
POST

#### Endpoint: 
/received-goods

#### Headers:

Authorization: Bearer Token

#### Body:

json

{
  "received_date": "ReceivedDate",
  "purchase_order_id": "PurchaseOrderID",
  "Organization": "Organization"
}

### Responses:

| Responses |        Meaning               |
| :--------  | :-------------------------------- |
| `201 Created`     | Received goods created successfully.|
| `400 Bad Request`     |Invalid request body or purchase_order_id is NULL.|
| `500 Internal Server Error`     | Server error. |


## GET Received goods item from batch id and si number
```http
GET /received_goods_items/:batch_id/:si_number
```

Gets received goods items associated with a specific batch and SI number.


### Request:

#### Method: 
GET

#### Endpoint: 
/received_goods_items/:batch_id/:si_number

#### Headers:

Authorization: Bearer Token

### Parameters:

batch_id (Path Parameter): ID of the batch.

si_number (Path Parameter): SI number.

#### Responses:

| Responses |        Meaning               |
| :--------  | :-------------------------------- |
| `200 OK`     | List of received goods items.|
| `400 Bad Request`     |Missing required parameters.|
| `404 Not Found`     | No received goods items found. |


## GET received goods from purchase_order_id and org

```http
GET /received-goods/:purchase_order_id/:org?
```


Gets received goods information based on purchase order ID and organization.


### Request:

#### Method: 
GET

#### Endpoint: 
/received-goods/:purchase_order_id/:org?

Headers:

Authorization: Bearer Token

#### Parameters:

purchase_order_id:  

(Path Parameter): ID of the purchase order.

org (Query Parameter - Optional): 

Organization filter.



### Responses:

| Responses |        Meaning               |
| :--------  | :-------------------------------- |
| `200 OK`     | List of received goods items.|
| `500 Internal Server Error`     |Server error.|



## GET usersFromEmail from useremail

```http
GET /usersFromEmail/:useremail
```

Gets user information based on the email address.

### Request:

#### Method: 
GET
#### Endpoint: 
/usersFromEmail/:useremail
#### Headers:
Authorization: Bearer Token

#### Parameters:

useremail (Path Parameter): Email address of the user.

### Responses:
| Responses |        Meaning               |
| :--------  | :-------------------------------- |
| `200 OK`     | User information retrieved successfully.|
| `401 Unauthorized`     |Token not found.|
| `404 Not Found`     |User not found.|


## GET users by userid


```http
GET /users/:userid
```

Gets user information based on user ID.

### Request:

#### Method: 
GET
#### Endpoint: 
/users/:userid
#### Headers:
Authorization: Bearer Token
#### Parameters:

userid (Path Parameter): ID of the user.
### Responses:
| Responses |        Meaning               |
| :--------  | :-------------------------------- |
| `200 OK`     | User information retrieved successfully.|
| `404 Not Found`     |User not found.|


## PATCH users by userid
```http
PATCH /users/:userid
```
Updates user information.

### Request:

#### Method: 
PATCH
#### Endpoint: 
/users/:userid
#### Headers:
Authorization: Bearer Token
#### Body:
json

{
  "name": "NewName",
  "email": "NewEmail",
  "image": "NewImageURL"
}

#### Parameters:


userid (Path Parameter): ID of the user.

### Responses:
| Responses |        Meaning               |
| :--------  | :-------------------------------- |
| `200 OK`     | User information updated successfully.|
| `404 Not Found`     |User not found.|
| `500 Internal Server Error`     |Server error.|

## GET all from selectedCategory where searchTerm fits
```http
GET /search/:searchTerm/:selectedCategory
```
Performs a search across multiple entities.

### Request:

#### Method: 
GET
Endpoint: /search?q=:query
#### Headers:
Authorization: Bearer Token
#### Parameters:

query (Query Parameter): Search query.
### Responses:
| Responses |        Meaning               |
| :--------  | :-------------------------------- |
| `200 OK`     | Search results retrieved successfully.|
| `500 Internal Server Error`     |Server error during the search operation.|


## General Notes
* All endpoints require a valid Bearer Token in the Authorization header for authentication.
* Errors are returned in JSON format with appropriate status codes and error messages.
* Pagination is supported in endpoints where applicable.