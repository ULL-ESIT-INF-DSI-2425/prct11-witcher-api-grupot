# Proyecto 11 - Posada del lobo blanco APIs
En este proyecto se han desarrollado Apis para poder manejar la posada del lobo blanco, sus ventas y compras, además de los cazadores y mercantes que la visitan. 
Se ha llevado a cabo mediante Typescript, MongoDB y el framework Express.

Mediante las Apis podemos crear, editar, listar y borrar los elementos de la posada. Aquí los elementos desarrollados: 
## Goods
Los elementos Goods son los objetos almacenados en la posada y aquellos que serán intercambiados entre cazadores y mercantes. Dichos objetos poseen los siguientes atributos que han de ser atribuidos para poder almacenarlos en la base de datos mongodb: 
- name (string): nombre del atributo
- description (string): breve descripción del objeto
- category (string): categoría del objeto
- material (string)
- value (number): valor en monedas
- stock (number): cantidad de objetos de este tipo que tiene la posada
- weight (number): peso del objeto
## Hunters
Los cazadores son los usuarios que nos comprarán siempre objetos a nosotros. Poseen estas características que han de ser almacenadas: 
- name (string): nombre del cazador
- race (string): tiene que ser de una raza específica
- location (string): lugar de residencia
## Merchants
Al igual que los cazadores nos compran los mercantes nos venden los bienes que la posada almacenará.
- name (string): nombre del mercante
- type (string): que tipo de cosas va a vender el mercante
- location (string): lugar de residencia.
## Transactions
Por cada compra-venta de algún bien se ha registrar, para ello están las transacciones que contendrán datos importantes en el intercambio: 
- transactionType (string): será una compra o una venta.
- personId (Types.ObjectId): Id de la persona a la que le hicimos la compra-venta (creada automaticamente por la bdd)
- personType (string): si ha sido un cazador o mercante
- personName (string)
- items (TransactionItemInterface[]): objetos envueltos en el intercambio (son un tipo de objetos involucrados exclusivamente en transacciones).
- totalAmount (number): precio total de la compra (suma de todos los objetos comprados)
- date (Date): fecha y hora de la compra, se completa automáticamente, por lo que no es necesario especificarlo en as api.
### TransactionItemInterface
Como se ha comentado antes las transacciones tienen que manejar un tipo de datos realcionados con los bienes, pero para no interferir directamente con los objetos de la bdd, hemos creado un tipo de dato nuevo llamado *TransactionItemInterface* que hará de capa intermedia entre transacciones y objetos. Poseen los siguientes argumentos:
-  goodId (Types.ObjectId): Id del objeto 
-  goodName (string): Nombre del objeto 
-  quantity (number): Cantidad de objetos intercambiados
-  unitPrice (number): Valor de cada objeto individual

Un ejemplo JSON de POST para transacciones sería el siguiente: 
```JSON
    {
        "transactionType": "sale",
        "personId": "681b242294df3b959fae02b5",
        "personType": "Merchant",
        "personName": "mercante",
        "items": [
            {
                "goodId": "681a5f5fa82b8d3e539777b6",
                "goodName": "cascanueces",
                "quantity": 2,
                "unitPrice": 8
            }
        ],
        "totalAmount": 2,
    }
```

**Más ejemplos de uso están en la documentación del código**.

**DIRECCIÓN HTTPS DE LA WEB EN RENDER:**

https://prct11-witcher-api-grupot.onrender.com