# European provider feasibility (2026-09-05 review)

This is a deliberately brief prioritization. Live marketplace verification was attempted, but the development environment's outbound CONNECT proxy blocked target requests with 403; assumptions must be rechecked before adding adapters.

| Marketplace | TT inventory / Germany practicality | Search and fields | Fragility | Recommendation |
|---|---|---|---|---|
| Kleinanzeigen | High; Germany-local | Public HTML; image, URL, price, location, partial date | High | Integrate (MVP) |
| Vinted | Medium-high for rubbers/apparel; shipping is often practical | Private web JSON; image, URL, price, condition, partial date | High | Integrate (MVP) |
| eBay DE/EU | High; domestic/EU shipping | Official OAuth Browse API provides images, URL, price and item metadata; seller/listing dates vary | Low once credentials exist | Next; requires developer credentials |
| willhaben.at | Medium; shipping must be agreed per seller | No broadly documented public search API; public pages expose core fields | High | Later |
| Marktplaats.nl | Medium; cross-border shipping varies | Partner APIs are not a general anonymous search API; HTML/private interfaces are brittle | High | Later |
| 2dehands / 2ememain | Low-medium; small-item shipping practical | Related marketplace web surfaces; no general public search API identified | High | Later |
| Leboncoin | High overall, medium relevance; France-to-DE varies | Private interfaces and strong access controls | Very high | Skip for now |
| Subito | Medium relevance; Italy shipping varies | No appropriate public search API identified | Very high | Skip for now |
| Wallapop | Medium; platform geography complicates DE delivery | Private mobile/web interfaces | Very high | Skip for now |
| Allegro | Medium-high; Poland-to-DE can be practical | Official API exists, but marketplace emphasis is not exclusively second-hand and OAuth adds setup | Medium | Later |

“Inventory” is a qualitative product judgment, not a measured count. For every later integration, repeat the required endpoint, terms, live-request, returned-field, and shipping review before writing code.
