Minebot initialisation .

0: Prevention: Minebot n'est utilisable uniquement sur la pool HiveOn avec Hiveos.

0.1:Ports: Pas besoin d'ouverture de ports spécifique pour le faire fonctionner.

1: Création du bot sur discord:

1.1: Connectez vous sur discord web [https://discord.com/](https://discord.com/)

1.2: Rendez-vous sur la page application dans la section developpement de discord [https://discord.com/developers/applications](https://discord.com/developers/applications)

1.3: Cliquez sur New Apllication ![app](https://nsa40.casimages.com/img/2021/03/24/210324110208845583.png)

1.4: Donnez un nom a votre bot et cliquez sur Create

1.5: Allez dans bot , cliquez sur ajouter un bot puis cliquez sur yes![yes](https://nsa40.casimages.com/img/2021/03/24/210324110812907084.png)

1.6: Ajoutez le bot sur votre discord aller dans Oauth2 et faite comme sur l'image ![auth](https://nsa40.casimages.com/img/2021/03/24/210324112054222698.png)

1.7: copier le lien dans un navigateur et ajouter le bot sur discord, gardez la page du bot de coter.

2: Téléchargement.

2.1: lancer hiveshell sur votre panel hiveos. ![shell](https://nsa40.casimages.com/img/2021/03/26/210326120030178356.png)

2.2: faite la commande: sudo su

2.3: utiliser la commande pour telecharger et décompresser les fichiers du bot: wget -c url -O - | sudo tar -xz -C /home

3: edition du fichier de configuration.

3.1: editez le fichier config avec la commande: touch /home/MineBot/config.json

3.2: Retournez sur la page discord, dans la section bot révélez et copier le token du bot: ![token](https://nsa40.casimages.com/img/2021/03/25/210325110409716467.png)

3.3: Dans config.json modifier la ligne "token": "", pour ajouter votre token de bot:   "token": "ton token",

3.4: modifier la ligne "miningId": "", en ajoutant votre wallet sans le 0x : "miningId": "your wallet not includ 0x",

3.5: modifier la ligne "botName": "MineBot", en modifiant MineBot par le nom de votre bot discord.

3.6: sauvegarder et quittez le fichier.

4: lancement.

4.1: lancer le bot avec la commande: ./home/MineBot/start.sh

4.2: sur discord crée deux channel pour le bot , dans un des channel fait la commade $help pour voir si il fonctionne.

4.3 faite les commandes indiqué dans le help $realTime dans le salon ou le bot va indiqué votre monnaie actuel

4.4 faite la commande $summary dans le salon ou le bot va faire un recapitulatif de récompense tout les jours a minuit.

5 lancement du bot au démmarrage du rig.

5.1 effectué la commande: touch /etc/systemd/system/botmine.service

5.2: ajoutez dans le fichier:

[Unit]
Description=Mine Bot

[Service]
Type=simple
ExecStart=/bin/bash /home/start.sh

[Install]
WantedBy=multi-user.target

5.3 faite la commande: systemctl enable myservice
