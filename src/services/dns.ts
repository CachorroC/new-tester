import * as dns from 'dns/promises';

async function dnsFetcher() {
  const resolver = await dns.resolve(
    'heart.rsasesorjuridico.com' 
  );

  console.log(
    resolver 
  );
  return dns.getServers();
}

console.log(
  dnsFetcher()
    .then(
      (
        rr 
      ) => {
        console.log(
          rr 
        );
        return rr;
      } 
    ),
);
