# Social Network API

**Secondo parziale per il corso di Progettazione e Produzione Multimediale**  
Università di Firenze - 2025

**Autore:** Niccolò Caselli  
**Matricola:** 7115264

## Descrizione del Progetto

Il progetto consiste nella realizzazione di un'API e un frontend che implementano le funzionalità principali di un social network.

### Funzionalità

- Gestione Profili: Visualizzazione e modifica del proprio profilo, consultazione di profili esterni
- Sistema Social: Feed personalizzato con post degli utenti seguiti, creazione di post, sistema di commenti e likes
- Network Sociale: Visualizzazione dei propri followers e following, possibilità di seguire/smettere di - seguire altri utenti
- Notifiche: Sistema di notifiche per tenere traccia delle interazioni (likes, commenti, nuovi follower)
- Gestione Contenuti: Creazione, modifica ed eliminazione dei propri post con controlli di proprietà

### Account di test

Per provare l'applicazione, è disponibile il seguente account di prova:

- email: test@gmail.com
- password: ppmAdmin1

### Deployment

- frontend: https://ppm-final.netlify.app
- backend: https://ppm-final-production.up.railway.app

## Architettura del Sistema

### Frontend

- **Framework:** React
- **State Management:** Zustand per la gestione dello store
- **Autenticazione:** Gestione dei access e refresh token. Gestione del refresh automatico dei token
- **Design:** Interface minimali per testare le API
- **Deploy:** Netlify

### Backend

- **Framework:** Django REST Framework
- **Database:** PostgreSQL
- **Deploy:** Docker + Railway
- **Autenticazione:** JWT (JSON Web Tokens)

## Documentazione API

- Tutti gli endpoint che richiedono autenticazione utilizzano JWT tokens
- Il sistema implementa controlli di proprietà per modifiche e cancellazioni
- Gli utenti staff hanno privilegi aggiuntivi per la gestione di contenuti multimediali (sono gli staff possono creare post "premium" con delle immagini invece che solo testo)

### Autenticazione

**`POST /api/auth/register/`**

- Registra un nuovo utente nel sistema
- **Body:** `{username, email, password, password_confirm, bio}`
- **Response:** Dati utente con token JWT

**`POST /api/auth/login/`**

- Effettua l'accesso utente
- **Body:** `{email, password}`
- **Response:** Dati utente con token JWT

**`POST /api/auth/token/refresh/`**

- Aggiorna il token JWT scaduto
- **Body:** `{refresh}`
- **Response:** Nuovo token di accesso

### Gestione Profilo

**`GET /api/auth/profile/`**

- Ottiene il profilo dell'utente autenticato
- **Richiede:** Autenticazione

**`PUT/PATCH /api/auth/profile/`**

- Aggiorna il profilo dell'utente corrente
- **Body:** `{username, bio, profile_picture}`
- **Richiede:** Autenticazione

**`GET /api/auth/users/{username}/`**

- Ottiene il profilo di un utente specifico
- **Richiede:** Autenticazione

### Sistema Social

**`POST /api/auth/follow/{username}/`**

- Inizia a seguire un utente
- **Richiede:** Autenticazione

**`POST /api/auth/unfollow/{username}/`**

- Smette di seguire un utente
- **Richiede:** Autenticazione

**`GET /api/auth/users/{username}/followers/`**

- Ottiene l'elenco dei follower di un utente
- **Richiede:** Autenticazione

**`GET /api/auth/users/{username}/following/`**

- Ottiene l'elenco degli utenti seguiti
- **Richiede:** Autenticazione

### Gestione Post

**`GET /api/posts/`**

- Ottiene i post della timeline (da utenti seguiti + propri post)
- **Richiede:** Autenticazione

**`POST /api/posts/`**

- Crea un nuovo post
- **Body:** `{content, image (optional)}`
- **Nota:** Solo gli staff possono includere immagini
- **Richiede:** Autenticazione

**`GET /api/posts/{id}/`**

- Ottiene un post specifico
- **Richiede:** Autenticazione

**`PUT/PATCH /api/posts/{id}/`**

- Aggiorna il proprio post
- **Body:** `{content, image}`
- **Richiede:** Autenticazione + proprietà del post

**`DELETE /api/posts/{id}/`**

- Elimina il proprio post
- **Richiede:** Autenticazione + proprietà del post

**`GET /api/posts/users/{username}/`**

- Ottiene tutti i post di un utente specifico
- **Richiede:** Autenticazione

### Sistema Commenti

**`GET /api/posts/{post_id}/comments/`**

- Ottiene tutti i commenti di un post
- **Richiede:** Autenticazione

**`POST /api/posts/{post_id}/comments/`**

- Aggiunge un commento a un post
- **Body:** `{content}`
- **Richiede:** Autenticazione

**`GET /api/posts/comments/{id}/`**

- Ottiene un commento specifico
- **Richiede:** Autenticazione

**`PUT/PATCH /api/posts/comments/{id}/`**

- Aggiorna il proprio commento
- **Body:** `{content}`
- **Richiede:** Autenticazione + proprietà del commento

**`DELETE /api/posts/comments/{id}/`**

- Elimina il proprio commento
- **Richiede:** Autenticazione + proprietà del commento

### Sistema Likes

**`POST /api/posts/{post_id}/like/`**

- Mette "Mi piace" a un post
- **Richiede:** Autenticazione

**`POST /api/posts/{post_id}/unlike/`**

- Rimuove "Mi piace" da un post
- **Richiede:** Autenticazione

**`GET /api/posts/{post_id}/likes/`**

- Ottiene l'elenco degli utenti a cui è piaciuto un post
- **Richiede:** Autenticazione

### Endpoint Notifiche

**`GET /api/notifications/`**

- Ottiene le notifiche dell'utente corrente
- Richiede: Autenticazione

**`POST /api/notifications/{notification_id}/read/`**

- Segna una notifica come letta
- Richiede: Autenticazione

**`POST /api/notifications/mark-all-read/`**

- Segna tutte le notifiche come lette
- Richiede: Autenticazione
