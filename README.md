# Drops
 Discord bot written in discord.js v13
 
support **Admin** **Tickets** **Information** and More...


## Features


### Infraction System

commands : `ban` `unban` `kick` `mute` `unmute` `warn` `infractions` ...


### Waring System

You must have a mongodb account & mongsb compass.
Save ExecuterID, ExecuterTag, TargetID, TargetTag, Reason, Date in mongodb database.

parent command : `warnings`
sub commands : `add` `check` `remove` `clear`


## Ticket System
You can create an embed to open a ticket with the ticketsetup command and enter details using the sub command. 

Within a ticket, you can specify members who can view the ticket using the ticket action command. 

Ticket conversation lists are stored in mongoDB Schema and are provided in html file format.
