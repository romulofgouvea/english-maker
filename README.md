# Robo de criação de conteúdo de Inglês 


# Objetivo
 - Buscar 10 Palavras em inglês
 - Buscar Definições
 - Buscar Exemplos
 - Criar as traduções
 - Criar um vídeo
 - Postar no canal do YouTube
 - Colocar os arquivos gerados no Drive para as pessoas usarem em seus aplicativos de repetição espaçada (Texto e audio)

# 1 Robô de texto

```
API's: 
 - IBM Watson LT (Language Translator)
 - IBM Watson NLU (Natural Language Understanding)
 - Google Tradutor
 - Fraze.it
 - Oxford Dictionary
```

# 2 Robô de áudio

```
API's: 
 - IBM Watson TTS (Text To Speech) para o audio do texto da palavra e das frases.
 - Google TTS (Text To Speech) para o audio do texto da palavra e das frases.

```

# 3 Robô de vídeo

```
 - ImageMagick para criar as imagens com texto
 - Ffmpeg para criar e unir os videos com base no audio.
```

# 4 Robô do YouTube

```
 - OAuth 2
 - Organize folders
 - Upload Video
```

# 5 Robô do Drive

```
 - OAuth 2
 - Create zip
 - Upload zip
 - Update description video
```



#  Instruções

## Iniciando o projeto

```bash
git clone git@github.com:romulofgouvea/english-maker.git

cd english-maker && npm i
```
 - Instalar [Ffmpeg](https://ffmpeg.org/download.html)
 - Instalar [Graphics magic](http://www.graphicsmagick.org/download.html#download-sites) e/ou [Image magic](https://imagemagick.org/script/download.php).
 - Colocar o *.env* das APIs na raiz do projeto
 

## Com o terminal ja pasta principal e digite: 

```bash
touch .env
```

 Lista de ENV utilizadas:
 
 - Utilizadas no sistema
    - WORDS_FOR_DAY 
    - LIMIT_DEFINITIONS
    - LIMIT_EXAMPLES
    - KEYWORDS_OF_EACH

 - Oxford DIctionaries
    - OXFORD_BASE_URL 
    - OXFORD_APP_ID 
    - OXFORD_API_KEY 

 - IBM Watson
    - IBM_TTS_URL 
    - IBM_TTS_API_KEY 
 
    - IBM_LT_URL 
    - IBM_LT_API_KEY 
    
    - IBM_NLU_URL 
    - IBM_NLU_API_KEY 

 - Google Cloud Api
    - GOOGLE_T_URL 
    - GOOGLE_T_API_KEY 
    
    - GOOGLE_TTS_URL 
    - GOOGLE_TTS_API_KEY 
    
    - GOOGLE_YT_URL
    - GOOGLE_YT_API_KEY
    
    - GOOGLE_YT_CLIENT_ID
    - GOOGLE_YT_CLIENT_SECRET
    - GOOGLE_YT_REDIRECT_URI

 - Fraze.it
    - FRAZE_BASE_URL 
    - FRAZE_API_KEY 

ainda está em uma branch separada, nao usado na master ainda:
 - Instagram Api
    - INSTAGRAM_CLIENT_ID
    - INSTAGRAM_CLIENT_SECRET

 - Facebook Api
    - FACEBOOK_CLIENT_ID
    - FACEBOOK_CLIENT_SECRET
    - FACEBOOK_REDIRECT_URI
    - FACEBOOK_URL


## Criar as pastas necessárias:
 - assets/temp
 - assets/state
 - assets/uploads
 - assets/videos/final_render

Com o terminal ainda na pasta principal:

```bash
   mkdir src/assets/temp
   mkdir src/assets/state
   mkdir src/assets/uploads
   mkdir src/assets/videos/final_render
```

## Contributing
<table>
  <tr>
    <td align="center"><a href="https://github.com/romulofgouvea">
        <img src="https://avatars3.githubusercontent.com/u/16581559?s=460&v=4" width="100px;" alt="Romulo F."/><br /><sub>
        <b>Romulo F. Gouvea</b></sub></a>
    </td>
  </tr>
</table>

## License
[MIT](https://choosealicense.com/licenses/mit/)
