const express = require('express');
const app = express();
const expressGraphQL = require('express-graphql').graphqlHTTP;

const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull,
    GraphQLInt,
    GraphQLList
} = require('graphql');

const authors = require('./authors.json');
const books = require('./books.json');

const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'Representa libros',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
        author: {
            type: AuthorType,
            resolve: (book) => {
                return authors.find(author => author.id === book.authorId)
            }
        }
    })
});

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'Representa autores',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        lastname: { type: GraphQLNonNull(GraphQLString) }
    })
});

const RootMutationType= new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () =>({
        addBook:{
            type:BookType,
            description: 'Add a book',
            args:{
                name: { type: GraphQLNonNull (GraphQLString)},
                authorId: { type: GraphQLNonNull(GraphQLInt) },
            },
            resolve: (parent, args) =>{
                const book ={
                    id : books.length +1,
                    name: args.name,
                    authorId:args.authorId
                }
                books.push(book)
                return book
            }
        },
        addAuthor:{
            type:AuthorType,
            description: 'Add a author',
            args:{
                name: { type: GraphQLNonNull (GraphQLString)},
                lastname: { type: GraphQLNonNull(GraphQLString) },
            },
            resolve: (parent, args) =>{
                const author ={
                    id : authors.length +1,
                    name: args.name,
                    lastname:args.lastname
                }
                authors.push(author)
                return author
            }
        },
    })
});

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root query',
    fields: () => ({
        books: {
            type: new GraphQLList(BookType),
            description: 'List of All Books',
            resolve: () => books
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'List of All Authors',
            resolve: () => authors
        },
        author: {
            type: AuthorType,
            description: 'Particular Author',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => authors.find(author => author.id === args.id)
        },
        book: {
            type: BookType,
            description: 'Particular Book',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => { return books.find(book => book.id === args.id)}
        },
    }),
});

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
});


app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true
}));

app.listen(3000, () => {
    console.log('Server running');
});