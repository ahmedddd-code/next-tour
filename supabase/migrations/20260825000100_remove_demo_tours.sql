-- В публичном каталоге остаются только предложения, импортированные от туроператоров.
delete from public.app_tours
where coalesce(data->>'partnerSource', '') = ''
   or coalesce(data->>'externalOfferId', '') = '';
