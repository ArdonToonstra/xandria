---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
draft: false
status: "Beschikbaar"
property_type: "Appartement"
price: 950
surface: 85
bedrooms: 2
bathrooms: 1
garden: false
balcony: true
parking: false
furnished: false
pets_allowed: false
smoking_allowed: false
images: [
  "/images/listings/{{ .Name }}/foto1.jpg",
  "/images/listings/{{ .Name }}/foto2.jpg",
  "/images/listings/{{ .Name }}/foto3.jpg"
]
features: [
  "Centrale verwarming",
  "Volledig gerenoveerd",
  "Energielabel B"
]
address: "Straatnaam 123, 2000 Antwerpen"
gemeente: "Centrum"
available_from: "{{ dateFormat "2006-01-02" .Date }}"
lease_duration: "Langetermijn"
deposit: 2850
utilities_included: false
---

Beschrijf hier het appartement in het Nederlands.

## Locatie
Gelegen in het hart van...

## Indeling
Het appartement bestaat uit...

## Voorzieningen
In de directe omgeving vindt u...