import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Configuración de Supabase
const supabaseUrl = 'https://mkfskaddbzgftyswmyba.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rZnNrYWRkYnpnZnR5c3dteWJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MDA5NjEsImV4cCI6MjA5NTk3Njk2MX0.UNwUygxQ6wCE3fImpR_wyBEHR1zrN850FNNJAa_tUJs'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Exportamos también una versión adaptada de los nombres originales por si alguna parte del código aún los usa
export const API_CONFIG = {
    urlBase: supabaseUrl,
    endpoints: {}
};
