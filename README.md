# NoteManagerAPI

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