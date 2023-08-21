process.env.NODE_ENV = "test"

const app = require('../app')
const request = require('supertest')
const db = require('../db')

let book_isbn;

beforeEach(async () => {
    let result = await db.query(
        `INSERT INTO books(isbn, amazon_url, author, language, pages, publisher, title, year)
            VALUES(
                '1416968237', 
                'https://www.amazon.com/Summer-I-Turned-Pretty/dp/1416968237/ref=asc_df_1416968237/?tag=hyprod-20&linkCode=df0&hvadid=312125785651&hvpos=&hvnetw=g&hvrand=4741696294048971448&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9003244&hvtargid=pla-434720534383&psc=1',
                'Jenny Han',
                'English',
                '543',
                'Simon & Schuster Books for Young Readers',
                'The Summer I Turned Pretty',
                '2009')
            RETURNING isbn`)
    book_isbn = result.rows[0].isbn
})

describe('GET /books', function(){
    test('Get list of books', async function(){
        const res = await request(app).get('/books');
        const books = res.body.books;
        expect(books).toHaveLength(1)
        expect(books[0]).toHaveProperty('language')
    })
})

describe('GET /books/isbn', function(){
    test('Get a single book', async function(){
        const res = await request(app).get(`/books/${book_isbn}`)
        const book = res.body.book;
        expect(book.isbn).toBe(book_isbn)
        expect(book).toHaveProperty('author')
    })
})

describe('POST /books', function(){
    test('Add a new book', async function(){
        const res = await request(app).post('/books').send({
            isbn : '123456789',
            amazon_url: "https://www.amazon.com/Romeo-and-Juliet",
            author: "William Shakespeare",
            language: "english",
            pages: 309,
            publisher: "Shakespeare",
            title: "Romeo and Juliet",
            year: 1597
        })
        const book = res.body.book
        expect(book).toHaveProperty('pages')
        expect(res.statusCode).toBe(201)
    })
})

describe('DELETE /books/:id', function(){
    test('Delete a book', async function(){
        const res = await request(app).delete(`/books/${book_isbn}`)
        expect(res.body).toEqual({message : 'Book deleted'})
    })
})

afterEach(async function(){
    await db.query('Delete from books')
})

afterAll(async function(){
    await db.end()
})